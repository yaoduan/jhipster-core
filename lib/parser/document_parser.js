/** Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const winston = require('winston');
const JDLObject = require('../core/jdl_object');
const JDLApplication = require('../core/jdl_application');
const JDLEntity = require('../core/jdl_entity');
const JDLEnum = require('../core/jdl_enum');
const JDLField = require('../core/jdl_field');
const JDLRelationship = require('../core/jdl_relationship');
const JDLValidation = require('../core/jdl_validation');
const JDLUnaryOption = require('../core/jdl_unary_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const ApplicationTypes = require('../core/jhipster/application_types');
const UnaryOptions = require('../core/jhipster/unary_options');
const BinaryOptions = require('../core/jhipster/binary_options');
const formatComment = require('../utils/format_utils').formatComment;


module.exports = {
  parseFromConfigurationObject
};

const USER = 'User';

let configuration;
let jdlObject;
let applicationsPerEntityName;

/**
 * Converts the intermediate document to a JDLObject from a configuration object.
 * @param configuration The configuration object, keys:
 *        - document
 *        - applicationType
 *        - applicationName
 *        - generatorVersion
 */
function parseFromConfigurationObject(configuration) {
  if (!configuration.document) {
    throw new Error('The parsed JDL content must be passed.');
  }
  init(configuration);
  fillApplications();
  fillEnums();
  fillClassesAndFields();
  fillAssociations();
  fillOptions();
  return jdlObject;
}

function init(passedConfiguration) {
  configuration = passedConfiguration;
  jdlObject = new JDLObject();
  applicationsPerEntityName = {};
  applicationsPerEntityName = {};
}

function fillApplications() {
  configuration.document.applications.forEach((application) => {
    if (configuration.generatorVersion) {
      application.config.jhipsterVersion = configuration.generatorVersion;
    }
    const jdlApplication = new JDLApplication({
      config: application.config,
      entities: getApplicationEntities(application)
    });
    jdlObject.addApplication(jdlApplication);
    fillApplicationsPerEntityName(jdlApplication);
  });
}

function fillApplicationsPerEntityName(application) {
  application.entities.forEach((entity) => {
    applicationsPerEntityName[entity] = applicationsPerEntityName[entity] || [];
    applicationsPerEntityName[entity].push(application);
  });
}

function getApplicationEntities(application) {
  let applicationEntities = application.entities.entityList;
  if (application.entities.entityList.includes('*')) {
    applicationEntities = configuration.document.entities.map(entity => entity.name);
  }
  if (application.entities.excluded.length !== 0) {
    applicationEntities = applicationEntities.filter(entity => !application.entities.excluded.includes(entity));
  }
  return applicationEntities;
}

function fillEnums() {
  for (let i = 0; i < configuration.document.enums.length; i++) {
    const enumObj = configuration.document.enums[i];
    jdlObject.addEnum(new JDLEnum({
      name: enumObj.name,
      values: enumObj.values,
      comment: formatComment(enumObj.javadoc)
    }));
  }
}

function fillClassesAndFields() {
  for (let i = 0; i < configuration.document.entities.length; i++) {
    const entity = configuration.document.entities[i];
    fillClassAndItsFields(entity);
  }

  addUserEntityIfNeedBe();
}

function addUserEntityIfNeedBe() {
  const relationshipsToTheUserEntity = getUserRelationships();
  if (relationshipsToTheUserEntity && relationshipsToTheUserEntity.length && !jdlObject.entities[USER]) {
    addUserEntity();
  }
}

function getUserRelationships() {
  return configuration.document.relationships.filter(val => val.to.name.toLowerCase() === USER.toLowerCase());
}

function addUserEntity() {
  jdlObject.addEntity(new JDLEntity({
    name: USER,
    tableName: 'jhi_user',
    fields: {}
  }));
}

function fillClassAndItsFields(entity) {
  entity.tableName = entity.tableName || entity.name;
  jdlObject.addEntity(new JDLEntity({
    name: entity.name,
    tableName: entity.tableName,
    fields: getFields(entity),
    comment: formatComment(entity.javadoc)
  }));
}

function getFields(entity) {
  const fields = {};
  for (let i = 0; i < entity.body.length; i++) {
    const field = entity.body[i];
    const fieldName = _.lowerFirst(field.name);
    if (fieldName.toLowerCase() === 'id') {
      continue; // eslint-disable-line no-continue
    }
    const fieldObject = new JDLField({
      name: fieldName,
      type: field.type,
      validations: getValidations(field, jdlObject.enums[field.type])
    });
    if (field.javadoc) {
      fieldObject.comment = formatComment(field.javadoc);
    }
    fields[fieldName] = fieldObject;
  }
  return fields;
}

function getValidations(field) {
  const validations = {};
  for (let i = 0; i < field.validations.length; i++) {
    const validation = field.validations[i];
    if (validation.constant) {
      validation.value = configuration.document.constants[validation.value];
    }
    validations[validation.key] = new JDLValidation({
      name: validation.key,
      value: validation.value
    });
  }
  return validations;
}

function fillAssociations() {
  for (let i = 0; i < configuration.document.relationships.length; i++) {
    const relationship = configuration.document.relationships[i];
    if (!relationship.from.injectedfield && !relationship.to.injectedfield) {
      relationship.from.injectedfield = _.lowerFirst(relationship.from.name);
    }
    jdlObject.addRelationship(new JDLRelationship({
      from: jdlObject.entities[relationship.from.name],
      to: jdlObject.entities[relationship.to.name],
      type: _.upperFirst(_.camelCase(relationship.cardinality)),
      injectedFieldInFrom: relationship.from.injectedfield,
      injectedFieldInTo: relationship.to.injectedfield,
      isInjectedFieldInFromRequired: relationship.from.required,
      isInjectedFieldInToRequired: relationship.to.required,
      commentInFrom: formatComment(relationship.from.javadoc),
      commentInTo: formatComment(relationship.to.javadoc)
    }));
  }
}

function fillOptions() {
  fillUnaryOptions();
  fillBinaryOptions();
  if (configuration.applicationType === ApplicationTypes.MICROSERVICE
      && Object.keys(configuration.document.microservice).length === 0) {
    globallyAddMicroserviceOption(configuration.applicationName);
  }
}

function globallyAddMicroserviceOption(applicationName) {
  jdlObject.addOption(new JDLBinaryOption({
    name: BinaryOptions.Options.MICROSERVICE,
    value: applicationName,
    entityNames: configuration.document.entities.map(entity => entity.name)
  }));
}

function fillUnaryOptions() {
  if (configuration.document.noClient.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.SKIP_CLIENT,
      entityNames: configuration.document.noClient.list,
      excludedNames: configuration.document.noClient.excluded
    }));
  }
  if (configuration.document.noServer.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.SKIP_SERVER,
      entityNames: configuration.document.noServer.list,
      excludedNames: configuration.document.noServer.excluded
    }));
  }
  if (configuration.document.noFluentMethod.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.NO_FLUENT_METHOD,
      entityNames: configuration.document.noFluentMethod.list,
      excludedNames: configuration.document.noFluentMethod.excluded
    }));
  }
  if (configuration.document.filter.list.length !== 0) {
    jdlObject.addOption(new JDLUnaryOption({
      name: UnaryOptions.FILTER,
      entityNames: configuration.document.filter.list,
      excludedNames: configuration.document.filter.excluded
    }));
  }
}

function fillBinaryOptions() {
  _.forEach(BinaryOptions.Options, (optionValue) => {
    _.forEach(configuration.document[optionValue], (documentOptionValue, documentOptionKey) => {
      if (configuration.applicationType === ApplicationTypes.MICROSERVICE
          && optionValue === BinaryOptions.Options.CLIENT_ROOT_FOLDER) {
        winston.warn('Using the \'clientRootFolder\' option inside a microservice is useless. It will be ignored.');
        return;
      }
      addBinaryOption(optionValue, documentOptionKey);
    });
  });
}

function addBinaryOption(key, value) {
  jdlObject.addOption(new JDLBinaryOption({
    name: key,
    value,
    entityNames: configuration.document[key][value].list,
    excludedNames: configuration.document[key][value].excluded
  }));
}

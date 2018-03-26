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
const chevrotain = require('chevrotain');

const Lexer = chevrotain.Lexer;

const tokens = {};

const namePattern = /[a-zA-Z_][a-zA-Z_\-\d]*/;
// All the names tokens of the pegjs implementation have been merged into
// a single token type. This is because they would cause ambiguities
// when the lexing stage is separated from the parsing stage.
// They restrictions on the names should be implemented as semantic checks
// That approach could also provide a better experience in an Editor
// As semantic checks don't require fault tolerance and recovery like
// syntax errors do.
const NAME = chevrotain.createToken({ name: 'NAME', pattern: namePattern });

// by defining keywords to 'inherit' from NAME, keywords become unreserved at the parser level.
// so CONSUME(t.NAME) could now also match a token of type t.APPLICATION.
const KEYWORD = chevrotain.createToken({
  name: 'KEYWORD',
  pattern: Lexer.NA,
  longer_alt: NAME,
  categories: NAME
});

function createToken(config) {
  // JDL has a great many keywords. Keywords can conflict with identifiers in a parsing
  // library with a separate lexing phase.
  // See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
  // a Concise way to resolve the problem without manually adding the "longer_alt" property dozens of times.
  if (_.isString(config.pattern) && namePattern.test(config.pattern)) {
    config.longer_alt = NAME;
    if (!config.categories) {
      // e.g. 'application' IS-A KEYWORD which in turn IS-A NAME
      config.categories = KEYWORD;
    } else {
      config.categories.push(KEYWORD);
    }
  }

  // readable labels for diagrams
  if (_.isString(config.pattern) && !config.label) {
    config.label = `'${config.pattern}'`;
  }

  // concisely collects all tokens to be exported
  const newToken = chevrotain.createToken(config);
  tokens[config.name] = newToken;
  return newToken;
}

// Some categories to make the grammar easier to read
const BOOLEAN = createToken({
  name: 'BOOLEAN',
  pattern: Lexer.NA
});

// Category For the Application Configuration key names
const CONFIG_KEY = createToken({
  name: 'CONFIG_KEY',
  pattern: Lexer.NA
});

createToken({
  name: 'WHITESPACE',
  pattern: /\s+/,
  // Whitespace insensitivity for the win.
  group: Lexer.SKIPPED,
  line_breaks: true
});

// Comments
createToken({
  name: 'COMMENT',
  pattern: /\/\*([\s\S]*?)\*\//,
  line_breaks: true
});

// Constants
// Application constants
createToken({ name: 'CONFIG', pattern: 'config' });
createToken({ name: 'ENTITIES', pattern: 'entities' });
createToken({
  name: 'BASE_NAME',
  pattern: 'baseName',
  categories: [CONFIG_KEY]
});
createToken({ name: 'PATH', pattern: 'path', categories: [CONFIG_KEY] });
createToken({
  name: 'PACKAGE_NAME',
  pattern: 'packageName',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'AUTHENTICATION_TYPE',
  pattern: 'authenticationType',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'HIBERNATE_CACHE',
  pattern: 'hibernateCache',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'CLUSTERED_HTTP_SESSION',
  pattern: 'clusteredHttpSession',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'WEBSOCKET',
  pattern: 'websocket',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'DATABASE_TYPE',
  pattern: 'databaseType',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'DEV_DATABASE_TYPE',
  pattern: 'devDatabaseType',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'PROD_DATABASE_TYPE',
  pattern: 'prodDatabaseType',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'USE_COMPASS',
  pattern: 'useCompass',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'BUILD_TOOL',
  pattern: 'buildTool',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'SEARCH_ENGINE',
  pattern: 'searchEngine',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'ENABLE_TRANSLATION',
  pattern: 'enableTranslation',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'APPLICATION_TYPE',
  pattern: 'applicationType',
  categories: [CONFIG_KEY]
});
// application must appear AFTER "applicationType" due to shorter common prefix.
createToken({ name: 'APPLICATION', pattern: 'application' });
createToken({
  name: 'TEST_FRAMEWORK',
  pattern: 'testFrameworks',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'LANGUAGES',
  pattern: 'languages',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'SERVER_PORT',
  pattern: 'serverPort',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'ENABLE_SOCIAL_SIGN_IN',
  pattern: 'enableSocialSignIn',
  categories: [CONFIG_KEY]
});
createToken({ name: 'USE_SASS', pattern: 'useSass', categories: [CONFIG_KEY] });
createToken({
  name: 'JHI_PREFIX',
  pattern: 'jhiPrefix',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'MESSAGE_BROKER',
  pattern: 'messageBroker',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'SERVICE_DISCOVERY_TYPE',
  pattern: 'serviceDiscoveryType',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'CLIENT_PACKAGE_MANAGER',
  pattern: 'clientPackageManager',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'CLIENT_FRAMEWORK',
  pattern: 'clientFramework',
  categories: [CONFIG_KEY]
});
createToken({ name: 'CLIENT_ROOT_FOLDER', pattern: 'clientRootFolder' });
createToken({
  name: 'NATIVE_LANGUAGE',
  pattern: 'nativeLanguage',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'FRONT_END_BUILDER',
  pattern: 'frontendBuilder',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'SKIP_USER_MANAGEMENT',
  pattern: 'skipUserManagement',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'ENABLE_SWAGGER_CODEGEN',
  pattern: 'enableSwaggerCodegen'
});
createToken({ name: 'TRUE', pattern: 'true', categories: [BOOLEAN] });
createToken({ name: 'FALSE', pattern: 'false', categories: [BOOLEAN] });
// Entity constants
createToken({ name: 'ENTITY', pattern: 'entity' });
createToken({ name: 'RELATIONSHIP', pattern: 'relationship' });
createToken({ name: 'ENUM', pattern: 'enum' });
// Relationship types
createToken({ name: 'ONE_TO_ONE', pattern: 'OneToOne' });
createToken({ name: 'ONE_TO_MANY', pattern: 'OneToMany' });
createToken({ name: 'MANY_TO_ONE', pattern: 'ManyToOne' });
createToken({ name: 'MANY_TO_MANY', pattern: 'ManyToMany' });

// Options
createToken({ name: 'TO', pattern: 'to' });
createToken({ name: 'ALL', pattern: 'all' });
createToken({ name: 'STAR', pattern: '*' });
createToken({ name: 'WITH', pattern: 'with' });
createToken({ name: 'EXCEPT', pattern: 'except' });
createToken({ name: 'NO_FLUENT_METHOD', pattern: 'noFluentMethod' });
createToken({ name: 'DTO', pattern: 'dto' });
createToken({ name: 'PAGINATE', pattern: 'paginate' });
createToken({ name: 'SERVICE', pattern: 'service' });
createToken({ name: 'MICROSERVICE', pattern: 'microservice' });
createToken({ name: 'SEARCH', pattern: 'search' });
createToken({
  name: 'SKIP_CLIENT',
  pattern: 'skipClient',
  categories: [CONFIG_KEY]
});
createToken({
  name: 'SKIP_SERVER',
  pattern: 'skipServer',
  categories: [CONFIG_KEY]
});
createToken({ name: 'ANGULAR_SUFFIX', pattern: 'angularSuffix' });
createToken({ name: 'FILTER', pattern: 'filter' });

// validations
createToken({ name: 'REQUIRED', pattern: 'required' });
createToken({
  name: 'MIN_MAX_KEYWORD',
  pattern: Lexer.NA,
  categories: KEYWORD
});
createToken({
  name: 'MINLENGTH',
  pattern: 'minlength',
  categories: [tokens.MIN_MAX_KEYWORD]
});
createToken({
  name: 'MAXLENGTH',
  pattern: 'maxlength',
  categories: [tokens.MIN_MAX_KEYWORD]
});
createToken({
  name: 'MINBYTES',
  pattern: 'minbytes',
  categories: [tokens.MIN_MAX_KEYWORD]
});
createToken({
  name: 'MAXBYTES',
  pattern: 'maxbytes',
  categories: [tokens.MIN_MAX_KEYWORD]
});
createToken({
  name: 'MAX',
  pattern: 'max',
  categories: [tokens.MIN_MAX_KEYWORD]
});
createToken({
  name: 'MIN',
  pattern: 'min',
  categories: [tokens.MIN_MAX_KEYWORD]
});
createToken({ name: 'PATTERN', pattern: 'pattern' });

createToken({ name: 'REGEX', pattern: /\/[^\n\r/]*\// });
createToken({ name: 'INTEGER', pattern: /-?\d+/ });
// No escaping, no unicode, just a plain string literal
createToken({ name: 'STRING', pattern: /"(?:[^"])*"/ });

// punctuation
createToken({ name: 'LPAREN', pattern: '(' });
createToken({ name: 'RPAREN', pattern: ')' });
createToken({ name: 'LCURLY', pattern: '{' });
createToken({ name: 'RCURLY', pattern: '}' });
createToken({ name: 'LSQUARE', pattern: '[' });
createToken({ name: 'RSQUARE', pattern: ']' });
createToken({ name: 'COMMA', pattern: ',' });
createToken({ name: 'EQUALS', pattern: '=' });
createToken({ name: 'DOT', pattern: '.' });

// Imperative the "NAME" token will be added after all the keywords to resolve keywords vs identifier conflict.
tokens.NAME = NAME;

const JDLLexer = new Lexer(_.values(tokens));

// Cannot export constants before they have been defined (unlike functions...)
module.exports = {
  tokens,
  JDLLexer
};
import { GraphQLString, GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLList, graphql, buildSchema } from 'graphql';
import { applySchemaCustomDirectives } from '../src/index';

import { expect } from 'chai';

const DEFAULT_TEST_SCHEMA = `type Query { value(input: String): String } schema { query: Query }`;

exports.testEqual = function({ directives, query, schema, input, passServer = false, expected, done, context }) {

  let executionSchema = buildSchema(schema || DEFAULT_TEST_SCHEMA);

  if (!schema) {
    executionSchema._queryType._fields.value.resolve = (source, { input, context }) => input;
    if (passServer) {
      executionSchema._queryType._fields.value.directives = { duplicate: {by: 2} };
    }
  }

  executionSchema._directives = executionSchema._directives.concat(directives);

  applySchemaCustomDirectives(executionSchema);

  graphql(executionSchema, query, input, context)
    .then(({data, errors }) => {
      if (errors) {
        console.error(errors);
        throw new Error(errors);
      }
      expect(data).to.eql(expected);
    })
    .then(done, done);
}

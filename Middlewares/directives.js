// Modern Apollo Server directives implementation
const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');

// Authentication directive
const authDirectiveTransformer = (schema) => {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const authDirective = getDirective(schema, fieldConfig, 'auth')?.[0];

            if (authDirective) {
                const { resolve } = fieldConfig;

                fieldConfig.resolve = async function (...args) {
                    const [, , context] = args;

                    if (!context.isAuthenticated) {
                        throw new Error('Authentication required');
                    }

                    if (resolve) {
                        return resolve.apply(this, args);
                    }
                };
            }

            return fieldConfig;
        },
    });
};

// Admin role directive
const adminDirectiveTransformer = (schema) => {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const adminDirective = getDirective(schema, fieldConfig, 'admin')?.[0];

            if (adminDirective) {
                const { resolve } = fieldConfig;

                fieldConfig.resolve = async function (...args) {
                    const [, , context] = args;

                    if (!context.isAuthenticated) {
                        throw new Error('Authentication required');
                    }

                    if (!context.user || context.user.role !== 'admin') {
                        throw new Error('Admin access required');
                    }

                    if (resolve) {
                        return resolve.apply(this, args);
                    }
                };
            }

            return fieldConfig;
        },
    });
};

module.exports = {
    authDirectiveTransformer,
    adminDirectiveTransformer
}; 
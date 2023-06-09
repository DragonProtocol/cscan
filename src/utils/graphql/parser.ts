import { parse } from 'graphql/language';

export function parseToModelGraphqls(graphql: string): Map<string, string[]> {
    const modelGraphqlsMap = new Map<string, string[]>();
    if (!graphql || graphql.length == 0) return  modelGraphqlsMap

    const ast = parse(graphql);
    if (!ast || ast.definitions.length == 0) return modelGraphqlsMap;

    const enumTypeDefinitionMap = new Map<string, any>();
    const objectTypeDefinitionMap = new Map<string, any>();

    const definitions = ast.definitions;
    definitions.forEach((definition: any) => {
        const name = definition.name.value;
        const kand = definition.kind;
        // currently only support createModel directive
        if (definition.directives?.length > 0 && definition.directives[0].name.value == 'createModel') {
            const modelGraphqls = [];
            // iterate fields
            definition.fields.forEach((field: any) => {
                // parse object type
                const objectTypeName = field.type?.name?.value;
                if (objectTypeName){
                    if (objectTypeDefinitionMap.get(objectTypeName)){
                        modelGraphqls.push(objectTypeDefinitionMap.get(objectTypeName).loc.source.body.slice(objectTypeDefinitionMap.get(objectTypeName).loc.start, objectTypeDefinitionMap.get(objectTypeName).loc.end));
                    }
                }

                // parse enum type
                const enumTypeName = field.type?.type?.name?.value;
                if (enumTypeName){
                    if (enumTypeDefinitionMap.get(enumTypeName)){
                        modelGraphqls.push(enumTypeDefinitionMap.get(enumTypeName).loc.source.body.slice(enumTypeDefinitionMap.get(enumTypeName).loc.start, enumTypeDefinitionMap.get(enumTypeName).loc.end));
                    }
                }
            });
            modelGraphqls.push(definition.loc.source.body.slice(definition.loc.start, definition.loc.end));
            modelGraphqlsMap.set(name, modelGraphqls);
        }

        // build enum/object type definition map
        if (kand == 'EnumTypeDefinition') {
            enumTypeDefinitionMap.set(name, definition);
        }else if (kand == 'ObjectTypeDefinition') {
            objectTypeDefinitionMap.set(name, definition);
        }else {
            // TODO: handle other kind
            console.log(`unknown kind: ${kand}`);
        }
    });
    return modelGraphqlsMap;
}
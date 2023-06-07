import { parse } from 'graphql/language';

export function parseToModelGraphqls(graphql: string): Map<string, string[]> {
    const modelGraphqlsMap = new Map<string, string[]>();
    if (!graphql || graphql.length == 0) return  modelGraphqlsMap

    const ast = parse(graphql);
    if (!ast || ast.definitions.length == 0) return modelGraphqlsMap;

    // generate  EnumTypeDefinition/ObjectTypeDefinition map
    const enumTypeDefinitionMap = new Map<string, any>();
    const objectTypeDefinitionMap = new Map<string, any>();

    const definitions = ast.definitions;
    definitions.forEach((definition: any) => {
        const name = definition.name.value;
        const kand = definition.kind;
        if (definition.directives?.length > 0 && definition.directives[0].name.value == 'createModel') {
            const modelGraphqls = [];
            definition.fields.forEach((field: any) => {
                // TODO
            });
            modelGraphqls.push(definition.loc.source.body.slice(definition.loc.start, definition.loc.end));
            modelGraphqlsMap.set(name, modelGraphqls);
        }

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
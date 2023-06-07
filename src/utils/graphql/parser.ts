import { parse } from 'graphql/language';

export function parseToModelGraphqls(graphql: string): [] {
    if (!graphql || graphql.length == 0) return []

    const ast = parse(graphql);
    if (!ast || ast.definitions.length == 0) return [];
    // checkout definitions of createModel derectives

    // generate  EnumTypeDefinition/ObjectTypeDefinition map


    // const definitions = ast.definitions;
    // return definitions.map((definition: any) => {
    //     const name = definition.name.value;
    //     return name
    // });
    return [];
}
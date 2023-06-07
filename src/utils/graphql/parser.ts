import GraphQLLanguage from 'graphql/language';

export function parseToModelGraphqls(grapql: string): [] {
    if(grapql) {
        const ast = GraphQLLanguage.parse(grapql);
        const definitions = ast.definitions;
        return definitions;
    }
    return [];
}
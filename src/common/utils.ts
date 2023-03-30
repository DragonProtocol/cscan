export const importDynamic = new Function(
  'modulePath',
  'return import(modulePath)',
);

export function createGraphqlDefaultQuery(modelName: string, propertes: any[]){
  return `
  {
    ${modelName}Index(first: 2) {
      edges {
        node {
          id,${propertes.map(p=>{
            return p[0]+(p[1].type=='view'?'{id}':'')
          })}
        }
      }
    }
  }
  `
}
import get from 'lodash.get'

export default function getRef(graph,ref) {
  if(get(ref,'$type', false) !== 'ref') return {}
  return get(graph, `${ref.value[0]}[${ref.value[1]}]`, {})
}
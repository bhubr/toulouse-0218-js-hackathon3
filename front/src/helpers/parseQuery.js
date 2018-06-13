const parseQuery = query => query
  .split('&')
  .map(bit => bit.split('='))
  .reduce((carry, kv) => ({ ...carry, [kv[0]]: decodeURIComponent(kv[1]) }), {})

export default parseQuery

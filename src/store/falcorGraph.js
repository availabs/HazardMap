 // import { host } from '../constants'
import { Model } from 'falcor'
import HttpDataSource from 'falcor-http-datasource'

import store from "store"
import { update } from "utils/redux-falcor/components/duck"

//export let host =
// let host = 'https://graph.availabs.org/'
let host = "http://localhost:4444/graph/"
//let host = process.env.NODE_ENV === 'production' ? 'https://graph.availabs.org/' : '/';


console.log("API HOST:", host)

class CustomSource extends HttpDataSource {
  onBeforeRequest (config) {
    if (window.localStorage) {
      const userToken = window.localStorage.getItem('userToken');
      if (userToken) {
        config.headers['Authorization'] = userToken;
      }
    }
    // // console.log('header', config.headers)
    // config.url = config.url.replace(/%22/g, '%27')
    // // config.url = config.url.replace(/"/g, "'")
    // var splitUrl = config.url.split('?')
    // if (splitUrl[1] && config.method === 'GET') {
    //   // config.url = splitUrl[0] + '?' + encodeURI(splitUrl[1])
    //   delete config.headers
    // } else if (config.method === 'POST') {
    //   config.method = 'GET'
    //   delete config.headers
    //   config.url = config.url + '?' + config.data.replace(/%22/g, '%27')
    //   // console.log(config.url)
    // }
    // console.log('FR:', config)
  }
}

function cacheFromStorage () {
  let falcorCache = {}
  // if (localStorage && localStorage.getItem('falcorCache')) {
  //   let token = localStorage.getItem('token')
  //   let user = localStorage.getItem('currentUser')
  //   if (token && user) {
  //     falcorCache = JSON.parse(localStorage.getItem('falcorCache'))
  //   }
  // }
  return falcorCache;
}

export const falcorGraph = (() =>
  new Model({
    source: new CustomSource(host + 'graph', {
      crossDomain: true,
      withCredentials: false,
      timeout: 120000
    }),
    errorSelector: (path, error) => {
      console.log('errorSelector', path, error);
      return error;
    },
    cache: cacheFromStorage()
  }).batch()
)()

export const chunker = (values, request, options = {}) => {
  const {
    placeholder = "replace_me",
    chunkSize = 50
  } = options;

  const requests = [];

  for (let n = 0; n < values.length; n += chunkSize) {
    requests.push(request.map(r => r === placeholder ? values.slice(n, n + chunkSize) : r));
  }
  return requests.length ? requests : [request];
}
export const falcorChunker = (values, request, options = {}) => {
  const {
    falcor = falcorGraph,
    ...rest
  } = options;
  return chunker(values, request, rest)
    .reduce((a, c) => a.then(() => falcor.get(c)), Promise.resolve());
}

export const falcorChunkerWithUpdate = (values, request, options = {}) =>
  falcorChunker(values, request, options)
    .then(() => {
      const {
        falcor = falcorGraph
      } = options;
      store.dispatch(update(falcor.getCache()));
    });

const getArgs = args =>
  args.reduce((a, c) => {
    if (Array.isArray(c)) {
      a[0].push(c);
    }
    else {
      a[1] = c;
    }
    return a;
  }, [[], {}])

export const falcorChunkerNice = (...args) => {
  const [requests, options] = getArgs(args);
  const {
    index = null,
    placeholder = "replace_me",
    ...rest
  } = options;

  return requests.reduce((a, c) => {
    return a.then(() => {
      let values = [], found = false;

      const replace = c.map((r, i) => {
        if (Array.isArray(r) && r.length && !found && (index === null || index === i)) {
          found = true;
          values = r;
          return placeholder;
        }
        return r;
      })
      return falcorChunker(values, replace, { ...rest, placeholder });
    })
  }, Promise.resolve())
}
export const falcorChunkerNiceWithUpdate = (...args) =>
  falcorChunkerNice(...args)
    .then(() => {
      const [, options] = getArgs(args);
      const {
        falcor = falcorGraph
      } = options;
      store.dispatch(update(falcor.getCache()));
    });

window.addEventListener('beforeunload', function (e) {
  // var falcorCache = falcorGraph.getCache();
  // console.log('windowUnload', falcorCache);
  // localStorage.setItem('falcorCache', JSON.stringify(falcorCache));
})

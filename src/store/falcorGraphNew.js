// import { host } from '../constants'
import { Model } from 'falcor'
import ModelRoot from "falcor/lib/ModelRoot"
import HttpDataSource from 'falcor-http-datasource'

import throttle from "lodash.throttle"

let host = "http://localhost:4444/graph/"

class CustomSource extends HttpDataSource {
 onBeforeRequest (config) {
   if (window.localStorage) {
     const userToken = window.localStorage.getItem('userToken');
     if (userToken) {
       config.headers['Authorization'] = userToken;
     }
   }
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

 // let counter = 0;
 class MyModelRoot extends ModelRoot {
   constructor(...args) {
     super(...args);

     this.listeners = {};

     this.onChange = this.onChange.bind(this);
     this.listen = this.listen.bind(this);
     this.unlisten = this.unlisten.bind(this);
   }
   onChange() {
     for (const listener in this.listeners) {
       this.listeners[listener]();
     }
   }
   listen(listener, func) {
     this.listeners[listener] = throttle(func.bind(listener), 50);
   }
   unlisten(listener) {
     delete this.listeners[listener];
   }
 }
 class MyModel extends Model {
   constructor(...args) {
     super(...args);

     this.modelRoot = this._root;

     this.onChange = this.onChange.bind(this);
     this.remove = this.remove.bind(this);
     this.chunk = this.chunk.bind(this);
   }
   onChange(listener, func) {
     this.modelRoot.listen(listener, func);
   }
   remove(listener) {
     this.modelRoot.unlisten(listener);
   }
   chunk(...args) {
     const [requests, options] = getArgs(args);
     return falcorChunkerNice(...requests, { falcor: this, ...options });
   }
 }

 export const falcorGraph = (() =>
  new MyModel({
    _root: new MyModelRoot(),
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

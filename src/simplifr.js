function defaults(){
  return {
    root: 'root',
    dilimiter: '.'
  }
}

/**
 * Simplified Data Api
 */

export function simplify(obj, dilimiter, root){
  dilimiter = dilimiter || defaults().dilimiter;
  root = root || defaults().root;

  return simplifyNode({}, root, obj, dilimiter);
}

export function add(data, path, obj, dilimiter){
  dilimiter = dilimiter || defaults().dilimiter;
  var node = data[path];

  if (node.type === 'array') {
    var max = Math.max.apply(null, node.childs);
    if (!isArray(obj)) obj = [obj];
    obj.forEach(function(d){
      node.childs.push(++max);
      simplifyNode(data, path + dilimiter + max, d, dilimiter);
    });
  }

  else if (node.type === 'object') {
    var keys = Object.keys(obj);
    keys.forEach(function(key){
      node.childs.push(key);
      simplifyNode(data, path + dilimiter + key, obj[key], dilimiter);
    });
  }

  return data;
}

export function update(data, path, obj, dilimiter){
  reset(data, path, dilimiter);
  simplifyNode(data, path, obj, dilimiter);
  return data;
}

export function remove(data, path, dilimiter){
  dilimiter = dilimiter || defaults().dilimiter;
  var pathSeq = path.split(dilimiter);
  var key = pathSeq.pop();
  var parentNode = pathSeq.length ? data[pathSeq.join(dilimiter)] : data;

  if (parentNode.type === 'array') key = +key;

  var idx = parentNode.childs.indexOf(key);
  if (idx > -1) parentNode.childs.splice(idx, 1);

  removeChildNode(data, path, dilimiter);

  return data;
}

export function reset(data, path, dilimiter){
  dilimiter = dilimiter || defaults().dilimiter;

  removeChildNode(data, path, dilimiter);
  data[path] = null;

  return data;
}

export function desimplify(data, path, dilimiter){
  dilimiter = dilimiter || defaults().dilimiter;
  path = path || defaults().root;

  return dive(path);

  function dive(path){
    var obj;
    var node = data[path];

    if (node.type === 'array') {
      obj = [];
      node.childs.forEach(function(key){
        obj.push(dive(path + dilimiter + key));
      });
    }

    else if (node.type === 'object') {
      obj = {};
      node.childs.forEach(function(key){
        obj[key] = dive(path + dilimiter + key);
      });
    }

    else obj = node;

    return obj;
  }
}

function simplifyNode(data, path, obj, dilimiter){
  dilimiter = dilimiter || defaults().dilimiter;

  dive(obj, path);

  return data;

  function dive(obj, path){
    data[path] = {
      type: 'object',
      childs: []
    };

    if (isArray(obj)) {
      data[path].type = 'array';
      for (var i = -1, l = obj.length; ++i < l;) {
        data[path].childs.push(i);
        dive(obj[i], path + dilimiter + i);
      }
    }

    else if (isObject(obj)) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          data[path].childs.push(key);
          dive(obj[key], path + dilimiter + key);
        }
      }
    }

    else data[path] = obj;

    return data;
  }
}

function removeChildNode(data, path, dilimiter){
  dilimiter = dilimiter || defaults().dilimiter;
  var node = data[path];

  if (node.type === 'array' || node.type === 'object') {
    node.childs.forEach(function(key){
      removeChildNode(data, path + dilimiter + key);
    });
  }

  delete data[path];

  return data;
}

/**
 * Utils
 */
function isArray(_) {
  return Object.prototype.toString.call(_) === '[object Array]';
}

function isObject(_) {
  return Object.prototype.toString.call(_) === '[object Object]';
}
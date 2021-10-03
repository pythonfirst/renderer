import { ShapeFlags } from './shared/shapeFlags.js';
import { ChildrenFlags } from './shared/childrenFlags.js';
import { SpecialAttributes } from './shared/constants.js';

export function render(vnode, container) {
  // 旧VNode
  const oldNode = container.vnode;

  // 旧node不存在，则直接挂载vnode
  if (!oldNode) {
    if (vnode) {
      mount(vnode, container);
      // mount 之后更新container的vnode的属性;
      container.vnode = vnode;
    }
  } else {
    // 旧节点存在
    // 新vnode也存在
    if (vnode) {
      patch(oldNode, vnode, container)
      // patch之后更新container的vnode属性为新vnode
      container.vnode = vnode;
    } else {
      // 只有旧节点没有新节点，则删除子节点
      container.removeChild(oldNode.el);
      container.vnode = null;
    }
  }
}


function mount(vnode, container) {
  const { shapeFlag, type} = vnode;
  console.log('vnode', vnode, typeof vnode, type, shapeFlag)
  if (shapeFlag & ShapeFlags.ELEMENT) {
    mountElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.COMPONENT) {
    mountComponent(vnode, container);
  } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    mountText(vnode, container)
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    mountFragment(vnode, container)
  } else if (shapeFlag & ShapeFlags.TELEPORT) {
    mountTelement(vnode, container)
  }
}

function patch(oldVNode, newVNode, container) {
  const { shapeFlag: oldFlag } = oldVNode;
  const { shapeFlag } = newVNode;
  if (oldFlag !== shapeFlag) {
    // 新旧vnode不相同
    replaceVNode(oldVNode, newVNode, container)
  } else if (shapeFlag & ShapeFlags.ELEMENT) {
    // patch 普通元素
    patchElement(oldVNode, newVNode, container)
  } else if (shapeFlag & ShapeFlags.COMPONENT) {
    // patch 组件元素
  } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // patch 文本节点
    patchText(oldVNode, newVNode, container)
  }
}

/**
 * 挂载严肃节点
 * @param {VNode} node 
 * @param {DOM Node} container 
 */
function mountElement(node, container) {
  const { type, props, children, childFlag } = node;
  const el = document.createElement(type);
  node.el = el; // 将真实DOM保存到vnode上

  // 处理props
  if (props) {
    for (let key in props) {
      patchProps(el, key, null, props[key])
    }
  }

  // 处理children
  if (children) {
    if (childFlag & ChildrenFlags.NO_CHILDREN) {
      //没有子节点无需处理
    } else {
      if (childFlag & ChildrenFlags.SINGLE_VNODE) {
        // 单个子节点挂载
        mount(children, el)
      } else if (childFlag & ChildrenFlags.MULTIPLE_VNODES) {
        // 多个子节点
        for (let n of children) {
          mount(n, el);
        }
      }
    }
  }

  container.appendChild(el);
}

/**
 * 挂载文本节点
 * @param {*} node 
 * @param {*} container 
 */
function mountText(node, container) {
  const el = document.createTextNode(node.children);

  node.el = el;

  container.appendChild(el);
}

/**
 * 替换节点
 * @param {*} oldVNode 
 * @param {*} container 
 */
function replaceVNode(oldVNode, newVNode, container) {
  const { el: oldEle } = oldVNode;
  container.removeChild(oldEle);
  mount(newVNode, container);
}

/**
 * patch 元素节点
 * @param {*} oldVNode 
 * @param {*} newVNode 
 * @param {*} container 
 * @returns 
 */
function patchElement(oldVNode, newVNode, container) {
  const { type: oldType, childFlag: oldChildFlag, children: oldChildren } = oldVNode;
  const { type: newType, childFlag: newChildFlag, children: newChildren } = newVNode;

  // 如果新旧vnode标签类型不同，则直接替换
  if (oldType !== newType ) {
    replaceVNode(oldVNode, newVNode, container);
    return
  }

  // 如果新旧vnode相同，则patch props和children
  // patch props
  const el = (newVNode.el = oldVNode.el);
  const { props: oldProps } = oldVNode;
  const { props: newProps } = newVNode;
  // 如果存在新属性，则更新到元素
  if (newProps) {
    for (let key in newProps) {
      const newVal = newProps[key];
      const oldVal = oldProps[key];
      patchProps(el, key, oldVal, newVal);
    }
  }

  // 如果存在旧属性，则遍历一遍把不存在于新vnode中的属性移除
  if (oldProps) {
    for (let key in oldProps) {
      const oldVal = oldProps[key];

      if (oldVal && !oldProps.hasOwnProperty(key)) {
        // 第四个参数null，代表移除
        patchProps(el, key, oldVal, null)
      }
    }
  }
  
  // patch 子节点
  patchChildren( oldChildFlag, newChildFlag, oldChildren, newChildren, el )
}

/**
 * patch props
 * @param {*} el 
 * @param {*} key 
 * @param {*} oldVal 
 * @param {*} newVal 
 */
function patchProps(el, key, oldVal, newVal) {
  console.log(key, oldVal, newVal)
  switch (key) {
    case 'style':
      // 将新的样式更新到元素
      for (let k in newVal) {
        el.style[k] = newVal[k];
      }

      // 遍历旧的样式，不存于心的中，则移除;
      for (let k in oldVal) {
        if (!oldVal.hasOwnProperty(k)) {
          el.style[k] = ''
        }
      }
      break;
    // class
    case 'class':
      // debugger
      el.className = newVal;
      break;
    default:
      if (SpecialAttributes.includes(key)) {
        // 作为DOM props处理
        el[key] = newVal
      } else {
        // 作为 el attr处理
        el.setAttribute(key, newVal)
      }
      break;
  }
}


/**
 * 
 * @param {*} oldflag 
 * @param {*} newFlag 
 * @param {*} oldVNode 
 * @param {*} newVNode 
 * @param {*} el 
 */
function patchChildren(oldFlag, newFlag, oldVNode, newVNode, container) {
  switch (oldFlag) {
    // 旧节点为单节点
    case ChildrenFlags.SINGLE_VNODE:
      switch (newFlag) {
        case ChildrenFlags.SINGLE_VNODE:
          patch(oldVNode, newVNode, container)
          break;
        
        case ChildrenFlags.NO_CHILDREN:
          container.removeChild(oldVNode.el)
          break;
        default: // 多个新children
          container.removeChild(oldVNode.el)
          for (let n of newVNode) {
            mount(n, container)
          }
          break;
      }
      break;
    
    // 旧节点没有
    case ChildrenFlags.NO_CHILDREN:
      switch (newFlag) {
        case ChildrenFlags.SINGLE_VNODE:
          mount(newVNode, container)
          break;
        
        case ChildrenFlags.NO_CHILDREN:
          break;
        default:
          for (let n of newVNode) {
            mount(n, container)
          }
          break;
      }
      break;
    
    // 旧子节点为多节点
    default:
      switch (newFlag) {
        case ChildrenFlags.SINGLE_VNODE:
          for (let n of oldVNode) {
            container.removeChild(n.el)
          }
          break;
        case ChildrenFlags.NO_CHILDREN:
          for (let n of oldVNode) {
            container.removeChild(n.el)
          }
          break;
        default:
          for (let n of oldVNode) {
            container.removeChild(n.el)
          }

          for (let n of newVNode) {
            mount(n, container)
          }
          break;
      }
      break;
  }
}

/**
 * 更新文本节点
 * @param {*} oldVNode 
 * @param {*} newVNode 
 * @param {*} container 
 */
function patchText(oldVNode, newVNode, container) {
  const el = (newVNode.el = oldVNode.el);
  
  if (oldVNode.children !== newVNode.children) {
    el.nodeValue = newVNode.children;
  }
}


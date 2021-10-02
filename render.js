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
      patch(vnode, oldNode, container)
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
    // debugger
    mountText(vnode, container)
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    mountFragment(vnode, container)
  } else if (shapeFlag & ShapeFlags.TELEPORT) {
    mountTelement(vnode, container)
  }
}

function patch(vnode, oldNode, container) {

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
      // debugger
      switch (key) {
        // 内联样式
        case 'style':
          for (let k in props['style'])
          el.style[k] = props['style'][k];
          break;
        // class
        case 'class':
          el.className = props.class
          break;
        default:
          if (SpecialAttributes.includes(key)) {
            // 作为DOM props处理
            el[key] = props[key];
          } else {
            // 作为 el attr处理
            el.setAttribute(key, props[key])
          }
          break
      }
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

  // debugger
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
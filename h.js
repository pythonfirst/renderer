import { ShapeFlags } from "./shared/shapeFlags.js";
import { ChildrenFlags } from "./shared/childrenFlags.js";
/**
 * 创建VNode
 * @param {*} type VNode类型
 * @param {*} props VNode属性
 * @param {*} children 子节点
 */
export function h(type, props=null, children=null) {

  let shapeFlag = null; // 初始化shapeFlag
  // 通过type的类型判断是否为普通元素vnode
  if (typeof type === 'string') {
    shapeFlag = ShapeFlags.ELEMENT
  } else {
    console.warn('暂不支持其他类型vnode')
  }

  let childFlag = null;

  // 子节点为数组
  if (Array.isArray(children)) {
    const { length } = children; // 获取子节点数组长度
    if (length === 0) {
      // 空数组，无子节点
      childFlag = ChildrenFlags.NO_CHILDREN;
    } else if (length === 1) {
      // 一个子节点
      childFlag = ChildrenFlags.SINGLE_VNODE;
      children = children[0];
    } else {
      // 多个子节点
      childFlag = ChildrenFlags.KEYED_VNODES;
      children = normalizeVNodes(children)
    }
  } else if (children === null) {
    // 没有子节点
    childFlag = ChildrenFlags.NO_CHILDREN;
  } else if (children._isVNode) {
    // 单个子节点
    childFlag = ChildrenFlags.SINGLE_VNODE;
  } else {
    // 其他情况均为文本节点
    childFlag = ChildrenFlags.SINGLE_VNODE;
    children = createTextVNode(String(children))
  }
  return {
    _isVNode: true,
    type,
    props,
    shapeFlag,
    childFlag,
    children,
  }
} 

function normalizeVNodes(children) {
  const newChildren = []
  // 遍历 children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.key == null) {
      // 如果原来的 VNode 没有key，则使用竖线(|)与该VNode在数组中的索引拼接而成的字符串作为key
      child.key = '|' + i
    }
    newChildren.push(child)
  }
  // 返回新的children，此时 children 的类型就是 ChildrenFlags.KEYED_VNODES
  return newChildren
}

export function createTextVNode(text) {
  return {
    _isVNode: true,
    // flags 是 VNodeFlags.TEXT
    shapeFlag: ShapeFlags.TEXT_CHILDREN,
    type: null,
    props: null,
    // 纯文本类型的 VNode，其 children 属性存储的是与之相符的文本内容
    children: text,
    // 文本节点没有子节点
    childFlags: ChildrenFlags.NO_CHILDREN
  }
}

console.log(h(
  'div', 
  {
    style: {
      width: '100px',
      height: '50px',
    },
    class: 'container',
  },
  [
    h('h1', null, '我是标题1'),
    h('h2', null, '我是标题2')
  ]
  ))
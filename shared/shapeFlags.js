export const ShapeFlags ={
  ELEMENT: 1,  // 普通元素
  FUNCTIONAL_COMPONENT: 1 << 1, // 函数式组件
  STATEFUL_COMPONENT: 1 << 2,  // 有状态组件
  TEXT_CHILDREN: 1 << 3,  // 子节点为文本即文本节点
  ARRAY_CHILDREN: 1 << 4, // 子节点为数组
  SLOTS_CHILDREN: 1 << 5,  // 子节点为slot
  TELEPORT: 1 << 6,  // teleport
  SUSPENSE: 1 << 7,  // suspense
  TEXT: 1 << 8,  // 需要被keep alive的组件
  COMPONENT_KEPT_ALIVE: 1 << 9,  // 已经被keep alive的组件
  COMPONENT: 1<<2 | 1<<1,  // 组件类型
}
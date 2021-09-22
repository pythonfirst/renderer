export const ChildrenFlags = {
  // 未知的 children 类型
  UNKNOWN_CHILDREN: 0,
  // 没有 children
  NO_CHILDREN: 1,
  // children 是单个 VNode
  SINGLE_VNODE: 1 << 1,  // 2

  // children 是多个拥有 key 的 VNode
  KEYED_VNODES: 1 << 2,  // 4
  // children 是多个没有 key 的 VNode
  NONE_KEYED_VNODES: 1 << 3,  // 8

  // 多节点子节点（包含keyed/unkeyed)
  MULTIPLE_VNODES: 1 << 3 | 1 <<2,
}
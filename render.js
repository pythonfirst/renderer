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


function mount(vnode, container, refNode) {
  const { shapeFlag, type} = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    mountElement(vnode, container, refNode);
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
function mountElement(node, container, refNode=null) {
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

  // 如果refNode存在，使用insertBefore,如果不存在使用
  if (refNode) {
    container.insertBefore(el, refNode);
  } else {
    container.appendChild(el);
  }
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
      const oldVal = oldProps?.[key];
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
  // console.log('oldVNode', oldVNode);
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
          // patchKeyedChildrenC(oldVNode, newVNode, container)
          // patchKeyedChildren(oldVNode, newVNode, container);
          patchUnkeyedChildren(oldVNode, newVNode, container);
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

/**
 * 求最长递增子序列
 * @param {*} nums 
 * @returns 
 */
var lengthOfLIS = function(nums) {
  /** 动态规划 */
  // 定义状态：dp[i] 为以nums[i]为结尾的最长递增子序列
  // 状态转移： dp[i] = max(dp[0-j]) + 1; 其中nums[j] < nums[i], j<i;
  // 注意初始化的为 1；
  // 注意状态转移方程不考虑nums[j]>nums[i]的情况

  const l = nums.length;
  const dp = new Array(l).fill(1);

  let max = 1;
  for (let i=1; i<l; i++) {
      for (let j=0; j<i; j++) {
          if (nums[i] > nums[j]) {
            dp[i] = Math.max(dp[i], dp[j]+1);
            max = max > dp[i] ? max : dp[i]
          }
      }
  }
  const res = new Array(max);
  // debugger

  let j = max
  for (let i=dp.length-1; i>=0; i--) {
    if (dp[i] === j) {
      j--
      res[j] = i;
    }
  }
  return res
};

/**
 * 
 * @param {*} c1 旧节点children
 * @param {*} c2 新节点children
 * @param {*} container 父容器
 */
function patchKeyedChildren(c1, c2, container) {
  // 两端遍历的
  let i=0;
  // 新子节点的长度
  const l2 = c2.length;

  // 旧节点最后一个元素索引
  let e1 = c1.length - 1 // prev ending index
  // 新节点最后一个元素索引
  let e2 = l2 - 1 // next ending index

  // 1.遍历新旧节点左边，遇到不同则停止
  // (a b) c
  // (a b) d e
  while (i<=e1 && i<=e2) {
    const n1 = c1[i];
    const n2 = c2[i];
    // debugger
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break;
    }
    i++;
  }

  // 2. 遍历新旧节点右边，遇到不同则停止
  // a (b c)
  // d e (b c)
  while (i<=e1 && i<=e2) {

    const n1 = c1[e1];
    const n2 = c2[e2];

    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break;
    }
    e1--;
    e2--;
  }

  console.log('i, e1, e2', i, e1, e2);
  // 3. 普通序列+mount
  // (a b)
  // (a b) c
  // i = 2, e1=1, e2=2;
  // (a b)
  // c(a b)
  // i=0; e1=-1; e2=0;
  // 说明旧子节点比新子节点少，并且有新子节点需要重新挂载
  if (i>e1) {

    // 找到新子节点需要挂载的区[i, e2]
    if (i <=e2) {
      const nextPos = e2+1;
      // DOM 挂载的refNode：insertBefore(node, refNode);
      const anchor = nextPos < l2 ? c2[nextPos].el : null;

      while (i <=e2) {
        mount(c2[i], container, anchor);
        i++
      }
    }
  }
  // 4. 普通序列+unmount
  // (a b) c
  // (a b)
  // i = 2, e1 = 2, e2 = 1
  // a (b c)
  // (b c)
  // i = 0, e1 = 0, e2 = -1
  else if (i > e2) {
    while (i <= e1) {
      container.removeChild(n1[i].el)
      i++;
    }
  }
  
  // 5. 未知序列
  // [i ... e1 + 1]: a b [c d e] f g
  // [i ... e2 + 1]: a b [e d c h] f g
  // i = 2, e1 = 4, e2 = 5
  else {
    const s1 = i;  // 旧子节点开始索引
    const s2 = i;  // 新子 节点开始索引

    // 5.1 创建新子节点的索引Map
    const keyToNewIndexMap = new Map();
    for (let i=s2; i<=e2; i++) {
      const child = c2[i];

      if (child !== null ) {
        keyToNewIndexMap.set(child.props.key, i)
      }
    }
    console.log('keyToNewIndexMap', keyToNewIndexMap);

    // 5.2 遍历旧节点
    let j;
    let patched = 0; // 已经patch的
    const toBePatched = e2-s1+1; // 待更新的新节点数量
    let moved = false // 是否有节点需要移动

    let maxNewIndexSoFar = 0; // 用来记录是否有节点被移动

    // 用于记录新节点在旧节点中的索引
    // 比正常的索引+1；
    // 默认值为0，表示为该新节点不存在于旧节点
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
    // 遍历旧节点
    for (i=s1; i<=e1; i++) {
      const n1 = c1[i];

      // 如果patched的数量大于待patched，说明多余的节点需要卸载
      if (patched >= toBePatched) {
        container.removeChild(n1.el);
        continue
      }

      let newIndex; // 旧子节点在新节点中的索引
      if (n1.props.key !== null) {
        newIndex = keyToNewIndexMap.get(n1.props.key)
      } else {
        // todo: 没有key的node，暂不处理
      }
      // 旧子节点在新子节点中不存在
      if (newIndex === undefined) {
        container.removeChild(n1.el);
      } else {
        // 存在于新子节点中，需要patch
        newIndexToOldIndexMap[newIndex-s1] = i +1 // offset+1
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          moved = true;
        }

        patch(n1, c2[newIndex], container);
        patched++;
      }
    }
    console.log('newIndexToOldIndexMap', newIndexToOldIndexMap);
    // 5.3 需要移动
    // 有需要移动的点
    const sequence = lengthOfLIS(newIndexToOldIndexMap) || [];
    j = sequence.length-1;
    console.log('sequence', sequence);
    // 倒序遍历新节点
    for (i = toBePatched-1; i>=0; i--) {
      const nextIndex = s2+i; // 新节点的索引

      const anchor = nextIndex +1 < l2 ? c2[nextIndex+1].el : null;

      if (newIndexToOldIndexMap[i] === 0) {
        // 说明该新节点在旧节点中不存在
        mount(c2[nextIndex], container, anchor);
      } else if (moved){
        // 说明该节点在旧节点存在，需要移动或者不移动
        if (j<0 || i !== sequence[j]) {
          // 需要移动
          container.insertBefore(c2[nextIndex].el, anchor)
        } else {
          // 不需要移动；
          j--;
        }
      }
    }
  }
}

/**
 * 自己写的core dom diff
 * @param {*} oldVNode 
 * @param {*} newVNode 
 * @param {*} container 
 */
function patchKeyedChildrenC(oldVNode, newVNode, container) {
  easyDiff(oldVNode, newVNode, container);
  // coreDiff(oldVNode, newVNode, container)
  // 简单diff
  function easyDiff(oldVNode, newVNode, container) {
    for (let n of oldVNode) {
      container.removeChild(n.el)
    }

    for (let n of newVNode) {
      mount(n, container)
    }

    // 优化diff
    const oldLen = oldVNode.length;
    const newLen = newVNode.length;

    const len = oldLen > newLen ? newLen : oldLen;

    for (let i=0; i<len; i++) {
      patch(oldVNode[i], newVNode[i], container)
    }
    
    // 新子节点少于旧子节点，将多余的旧子节点删除
    if (oldLen>newLen) {
      for (let i=len; i<oldLen; i++) {
        container.removeChild(oldVNode[i].el);
      }
    }

    // 新子节点比旧子节点多，将多的新子节点挂载
    if (oldLen<newLen) {
      for (let i=len; i<newLen; i++) {
        mount(newVNode[i], container)
      }
    }
  }

  function coreDiff(oldVNode, newVNode, container) {
    // 核心diff
    let oldStart = 0, oldEnd = oldVNode.length-1;
    let newStart = 0, newEnd = newVNode.length-1;

    // 遍历左端
    while (oldVNode[oldStart]?.props?.key === newVNode[newStart]?.props?.key && newStart <oldVNode.length) {
      patch(oldVNode[oldStart], newVNode[newStart], container)
      newStart++;
      oldStart++;
    }

    // 遍历右端
    while (oldVNode[oldEnd]?.props?.key === newVNode[newEnd]?.props?.key && newEnd>=0) {
      patch(oldVNode[oldEnd], newVNode[newEnd], container)
      newEnd--;
      oldEnd--;
    }

    // 旧子节点数量少于新子节点，需要新建节点
    if (oldStart > oldEnd && newStart <= newEnd) {
      // 找到insertBefore的refNode
      let refNode
      if (newEnd < newVNode.length-1) {
        refNode = newVNode[newEnd+1].el;
      } else {
        refNode = newVNode[newEnd].el
      }
      
      for (let i=oldEnd+1; i<=newEnd;  i++) {
        mount(newVNode[i], container, refNode)
      }
    } else if (newStart > newEnd && oldStart<=oldEnd){
      // 有旧字节点需要删除
      for (let i=oldStart; i<=oldEnd; i++) {
        container.removeChild(oldVNode[i].el)
      }
    } else {
      // debugger
      // 有需要移动的点

      // 建立keyToNewIndexMap，存储key值在新子序列的index
      const keyToNewIndexMap = new Map();
      for (let i=newStart; i<=newEnd; i++) {
        keyToNewIndexMap.set(newVNode[i].props.key, i)
      }
      console.log('keyToNewIndexMap', keyToNewIndexMap);

      // 创建newIndexToOldIndexMap, 存储新子节点在旧子节点中的index，如果不存在为默认值-1;
      const newIndexToOldIndexMap = new Array(newEnd-newStart+1).fill(-1);

      let moveFlag = false;  // 判断是否需要移动节点

      let pos = 0;  // 记录当前新节点最大索引值，如果出现新的j<pos,则说明有需要移动的点。

      let patched = 0; // 记录已经patch的节点数量,如果patched数量多于已经patched,则将已经patched删除。


      if (patched < newEnd-newStart+1) {
        for (let i=oldStart; i<=oldEnd; i++) {
          const oldV = oldVNode[i];
          const j = keyToNewIndexMap.get(oldV?.props.key);

          if (j !== undefined) {
            const newV = newVNode[j]
            patch(oldV, newV, container);
            patched++
            // 更新newIndexToOldIndexMap
            newIndexToOldIndexMap[j-newStart] = i;

            if (j < pos) {
              moveFlag = true;
            } else {
              pos = j
            }
          } else {
            // 没有找到=>旧节点不存于新节点 => 直接删除此节点
            container.removeChild(oldV.el)
          }
        }
      } else {
        container.removeChild(oldV.el)
      }
      console.log('newIndexToOldIndexMap', newIndexToOldIndexMap, 'moved', moveFlag);

      // 如果需要移动，则移动已经patch的数组
      if (moveFlag) {
        // 求最长递增子序列的index
        const list = lengthOfLIS(newIndexToOldIndexMap);
        console.log('list', list);

        let j = list.length-1;
        // 倒序遍历未被处理的新子节点
        for (let i=newIndexToOldIndexMap.length-1; i>=0; i--) {
          if (newIndexToOldIndexMap[i] === -1) {
            // 需要mount的新子节点
            // 计算该节点实际索引
            const pos = newStart + i;
            const refNode = pos+1 < newVNode.length ? newVNode[pos+1].el : null
            // 需要挂载的新节点
            mount(
              newVNode[pos],
              container,
              refNode,
            )
          } else if (i !== list[j]) {
            // 需要移动的子节点
            const pos = newStart + i;
            const refNode = pos+1 < newVNode.length ? newVNode[pos+1].el : null;
            container.insertBefore(newVNode[pos].el, refNode)
          } else {
            // 该索引位于最小递增子序列，不需要移动
            j--;
          }
        }
      }
    }
  }
}

/**
 * 是否为同类型VNode
 *  -type相同且key相同则视为相同type
 * @param {*} c1 VNode1
 * @param {*} c2 VNode2
 * @returns 
 */
function isSameVNodeType(c1,c2) {
  return (c1.type === c2.type) && (c1.props.key === c2.props.key)
}

/**
 * 
 * @param {*} c1 旧子节点
 * @param {*} c2 新子节点
 * @param {*} container 
 */
function patchUnkeyedChildren(c1, c2, container) {
  c1 = c1 || [];
  c2 = c2 || [];

  const oldLength = c1.length;
  const newLength = c2.length;
  const commonLength = Math.min(oldLength, newLength);

  let i;
  
  for (i=0; i< commonLength; i++) {
    patch(c1[i], c2[i], container)
  }

  // 如果旧节点多，则将未patch到的卸载
  if (oldLength > newLength) {
    for (i=commonLength; i<oldLength; i++) {
      container.removeChild(c1[i].el)
    }
  } else {
    // 如果新节点多，则将未patch到的挂载
    for (i=commonLength; i<newLength; i++) {
      mount(c2[i], container)
    }
  }
}


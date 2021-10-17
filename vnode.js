import { h } from './h.js';
import { render } from './render.js';

// [0,1,2,3]
// [3,0,1,2]
const list1 = [
  {
    value: 0,
    key: 'a',
  },
  {
    value: 1,
    key: 'b',
  },
  {
    value: 2,
    key: 'c',
  },
  {
    value: 3,
    key: 'd',
  },
]

const list2 = [
  {
    value: 3,
    key: 'd',
  },
  {
    value: 0,
    key: 'a',
  },
  {
    value: 1,
    key: 'b',
  },
  {
    value: 2,
    key: 'c',
  },
]

// [a,b,c]
// [a,d,b c]
const list3 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'c',
    key: 'c',
  },
];

// [a,b,d,c]
const list4 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'd',
    key: 'd',
  },
  {
    value: 'c',
    key: 'c',
  },
]

// [a,b,c,d,e,f]
const list5 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'c',
    key: 'c',
  },
  {
    value: 'd',
    key: 'd',
  },
  {
    value: 'e',
    key: 'e',
  },
]

const list6 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'd',
    key: 'd',
  },
  {
    value: 'e',
    key: 'e',
  },
];

// [a,b,c,d,e,f, g, h]
const list7 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'c',
    key: 'c',
  },
  {
    value: 'd',
    key: 'd',
  },
  {
    value: 'e',
    key: 'e',
  },
  {
    value: 'f',
    key: 'f',
  },
  {
    value: 'g',
    key: 'g',
  },
  {
    value: 'h',
    key: 'h',
  },
]

// [a,b,e,c,d,i,g, h]
const list8 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'e',
    key: 'e',
  },
  {
    value: 'c',
    key: 'c',
  },
  {
    value: 'd',
    key: 'd',
  },
  {
    value: 'i',
    key: 'i',
  },
  {
    value: 'g',
    key: 'g',
  },
  {
    value: 'h',
    key: 'h',
  },
]

// [a,b,c,d,e,f, g, h]
const list9 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'c',
    key: 'c',
  },
  {
    value: 'd',
    key: 'd',
  },
  {
    value: 'e',
    key: 'e',
  },
  {
    value: 'f',
    key: 'f',
  },
  {
    value: 'g',
    key: 'g',
  },
  {
    value: 'h',
    key: 'h',
  },
]

// [a,b,e,c,d,i,g, h,j]
const list10 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'e',
    key: 'e',
  },
  {
    value: 'c',
    key: 'c',
  },
  {
    value: 'd',
    key: 'd',
  },
  {
    value: 'i',
    key: 'i',
  },
  {
    value: 'g',
    key: 'g',
  },
  {
    value: 'h',
    key: 'h',
  },
  {
    value: 'j',
    key: 'j',
  },
]

const list11 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'c',
    key: 'c',
  },
  {
    value: 'd',
    key: 'd',
  },
  {
    value: 'e',
    key: 'e',
  },
  {
    value: 'f',
    key: 'f',
  },
  {
    value: 'g',
    key: 'g',
  },
  
]

const list12 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'e',
    key: 'e',
  },
  {
    value: 'c',
    key: 'c',
  },
  {
    value: 'd',
    key: 'd',
  },
  {
    value: 'h',
    key: 'h',
  },
 
  {
    value: 'f',
    key: 'f',
  },
  {
    value: 'g',
    key: 'g',
  },
]

// [a, b, c] [a d c]
const list13 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'c',
    key: 'c',
  },
]
const list14 = [
  {
    value: 'a',
    key: 'a',
  },
  {
    value: 'b',
    key: 'b',
  },
  {
    value: 'e',
    key: 'e',
  },
  {
    value: 'c',
    key: 'c',
  },
]


export const vnode_1_1 = h(
  'ul',
  null,
  new Array(10).fill(0).map((item, index) => {
    return h('li', null, index);
  })
)

export const vnode_1_2 = h(
  'ul',
  null,
  new Array(10).fill(0).map((item, index) => {
    if (index === 5) {
      return h('li', {class: 'li-diff'}, index+1);
    }
    return h('li', null, index);
  })
)

export const vnode_1_3 = h(
  'ul',
  null,
  list11.map(item => {
    return h('li', { key: item.key}, item.value);
  })
)

export const vnode_1_4 = h(
  'ul',
  null,
  list12.map( item => {
    return h('li', {key: item.key}, item.value);
  })
)
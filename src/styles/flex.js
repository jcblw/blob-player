import {css} from 'glamor'

export const flex = css({display: 'flex'})
export const row = css({flexDirection: 'row'})
export const column = css({flexDirection: 'column'})
export const flex0 = css({flex: 0})
export const flex1 = css({flex: 1})
export const flex20 = css({flex: 20})
export const alignItems = param => css({alignItems: param})
export const justifyContent = param => css({justifyContent: param})

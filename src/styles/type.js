
import {css} from 'glamor'

export const base = css({
  fontFamily: '"Montserrat", sans serif',
  margin: 0,
  color: '#666'
})

export const header = css(base, {
  fontSize: 22,
  fontWeight: 600,
  marginBottom: 10
})

export const subheader = css(base, {
  fontSize: 15,
  fontWeight: 400,
  marginBottom: 0
})

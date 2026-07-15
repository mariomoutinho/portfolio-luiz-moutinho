import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

Object.assign(navigator,{clipboard:{writeText:vi.fn().mockResolvedValue(undefined)}})
class IO { observe(){} unobserve(){} disconnect(){} }
vi.stubGlobal('IntersectionObserver',IO)

describe('portfolio',()=>{
  it('renderiza os seis projetos em destaque',()=>{render(<App/>);expect(screen.getAllByRole('article').filter(x=>x.className==='project-card')).toHaveLength(6)})
  it('abre o menu movel',async()=>{render(<App/>);const button=screen.getByRole('button',{name:'Abrir menu'});await userEvent.click(button);expect(button).toHaveAttribute('aria-expanded','true')})
  it('abre um estudo de caso',async()=>{render(<App/>);await userEvent.click(screen.getAllByRole('button',{name:/Ver estudo de caso/})[0]);expect(screen.getByRole('dialog')).toBeInTheDocument()})
  it('copia o e-mail',async()=>{render(<App/>);await userEvent.click(screen.getByRole('button',{name:'Copiar e-mail'}));expect(navigator.clipboard.writeText).toHaveBeenCalledWith('luizmariomoutinho1@gmail.com')})
})

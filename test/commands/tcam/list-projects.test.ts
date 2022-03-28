import {expect, test} from '@oclif/test'

describe('tcam:list-projects', () => {
  test
  .stdout()
  .command(['tcam:list-projects'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['tcam:list-projects', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

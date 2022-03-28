import {expect, test} from '@oclif/test'

describe('tcam:validate-apis', () => {
  test
  .stdout()
  .command(['tcam:validate-apis'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['tcam:validate-apis', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

import {expect, test} from '@oclif/test'

describe('tcam:generate-mock', () => {
  test
  .stdout()
  .command(['tcam:generate-mock'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['tcam:generate-mock', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

import {expect, test} from '@oclif/test'

describe('tcam:create-project', () => {
  test
  .stdout()
  .command(['tcam:create-project'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['tcam:create-project', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

import {expect, test} from '@oclif/test'

describe('tcam:import-apis', () => {
  test
  .stdout()
  .command(['tcam:import-apis'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['tcam:import-apis', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})

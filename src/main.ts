import * as core from '@actions/core'
import * as aws from 'aws-sdk'
import { deleteStack, DeleteStackInput } from './delete'

// The custom client configuration for the CloudFormation clients.
const clientConfiguration = {
  customUserAgent: 'aws-cloudformation-github-deploy-for-github-actions'
}

export async function run(): Promise<void> {
  try {
    const cfn = new aws.CloudFormation({ ...clientConfiguration })

    // Get inputs
    const stackName = core.getInput('name', { required: true })

    // CloudFormation Stack Parameter for the creation or update
    const params: DeleteStackInput = {
      StackName: stackName
    }

    const stackId = await deleteStack(cfn, params)
    core.setOutput('stack-id', stackId || 'UNKNOWN')
  } catch (err) {
    core.setFailed(err.message)
    core.debug(err.stack)
  }
}

/* istanbul ignore next */
if (require.main === module) {
  run()
}

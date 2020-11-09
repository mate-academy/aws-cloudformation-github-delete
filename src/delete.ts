import * as core from '@actions/core'
import * as aws from 'aws-sdk'

export type Stack = aws.CloudFormation.Stack
export type DeleteStackInput = aws.CloudFormation.Types.DeleteStackInput

export async function deleteStack(
  cfn: aws.CloudFormation,
  params: DeleteStackInput
): Promise<string | undefined> {
  const stack = await getStack(cfn, params.StackName)

  if (!stack) {
    core.debug(`Cannot fins stack with name ${params.StackName}`)

    return
  }

  await cfn.deleteStack(params).promise()
  await cfn
    .waitFor('stackDeleteComplete', { StackName: params.StackName })
    .promise()

  return stack.StackId
}

async function getStack(
  cfn: aws.CloudFormation,
  stackNameOrId: string
): Promise<Stack | undefined> {
  try {
    const stacks = await cfn
      .describeStacks({
        StackName: stackNameOrId
      })
      .promise()
    return stacks.Stacks?.[0]
  } catch (e) {
    if (e.code === 'ValidationError' && e.message.match(/does not exist/)) {
      return undefined
    }
    throw e
  }
}

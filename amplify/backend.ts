import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { assignAccount } from './functions/assign-account/resource';

const backend = defineBackend({
  auth,
  assignAccount
});

const authenticatedUserIamRole = backend.auth.resources.authenticatedUserIamRole;
backend.assignAccount.resources.lambda.grantInvoke(authenticatedUserIamRole);

backend.addOutput({
     custom: {
      assignAccountsFunctionName: backend.assignAccount.resources.lambda.functionName,
     },
});
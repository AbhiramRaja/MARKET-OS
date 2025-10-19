import { APIGatewayProxyEvent } from "aws-lambda";
export const getClaims = (event: APIGatewayProxyEvent): Record<string, any> => {
  const rc: any = event.requestContext || {};
  return rc.authorizer?.jwt?.claims || rc.authorizer?.claims || {};
};
export const getSellerId = (event: APIGatewayProxyEvent): string | undefined => {
  const claims = getClaims(event);
  return claims['sellerId'] || claims['custom:sellerId'];
};
export const getUserSub = (event: APIGatewayProxyEvent): string | undefined => {
  const claims = getClaims(event);
  return claims['sub'] || claims['cognito:username'];
};

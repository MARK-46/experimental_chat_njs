export class JWTParserUtility {
    static parse(access_token: any) {
        try {
            if (access_token && access_token.length === 80) { // if jwt
                return access_token;
            }
            let access_token_split = access_token.split('.');
            if (access_token_split[0] && access_token_split[1]) {
                let obj1 = JSON.parse(Buffer.from(access_token_split[0],
                    'base64').toString('ascii')); // jti
                let obj2 = JSON.parse(Buffer.from(access_token_split[1],
                    'base64').toString('ascii')); // jti
                if (typeof obj1['typ'] === 'string' && typeof obj2['jti'] === 'string') {
                    if (obj1['typ'] === 'JWT') {
                        return obj2['jti'];
                    }
                }
            }
        } catch (e) {
            console.log(`[TOKEN_PARSER] Exception:`, e.message || e);
        }
        return false;
    }
}

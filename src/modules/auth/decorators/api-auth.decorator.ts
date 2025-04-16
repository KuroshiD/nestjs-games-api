import { applyDecorators,  } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";

export function ApiAuth(summary: string) {
    return applyDecorators(
        ApiOperation({ summary }),
        ApiSecurity("bearer"),
        ApiResponse({
            status: 401,
            description: "Unauthorized",
        }),
        ApiResponse({
            status: 403,
            description: "Forbidden",
        })
    )
}
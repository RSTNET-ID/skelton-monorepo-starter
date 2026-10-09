declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
		}

		interface Locals {
			requestId: string;
		}
	}
}

export {};

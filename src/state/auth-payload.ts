import { isWalletInfoInjected } from '@tonconnect/sdk';
import { selector } from 'recoil';
import { connector } from 'src/connector';
import { TonProofDemoApi } from 'src/TonProofDemoApi';

// You can use any state manager, recoil is used just for example.

export const authPayloadQuery = selector({
	key: 'authPayload',
	get: async () => {
		const tonProofPayload = await TonProofDemoApi.generatePayload();

		return {
			tonProofPayload,
		};
	},
});

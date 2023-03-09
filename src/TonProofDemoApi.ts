import { TonProofItemReplySuccess } from '@tonconnect/protocol';
import { Account } from '@tonconnect/sdk';
import { connector } from './connector';
import './patch-local-storage-for-github-pages';

class TonProofDemoApiService {
	localStorageKey = process.env.REACT_APP_LOCAL_STORAGE_KEY!;

	host = process.env.REACT_APP_TON_PROOF_HOST!;

	accessToken: string | null = null;

	constructor() {
		this.accessToken = localStorage.getItem(this.localStorageKey);

		connector.onStatusChange((wallet) => {
			if (!wallet) {
				this.reset();
				return;
			}

			const tonProof = wallet.connectItems?.tonProof;

			if (tonProof) {
				if ('proof' in tonProof) {
					this.checkProof(tonProof.proof, wallet.account);
					return;
				}

				console.error(tonProof.error);
			}

			if (!this.accessToken) {
				connector.disconnect();
			}
		});
	}

	async generatePayload() {
		const response = await (
			await fetch(`${this.host}/ton-proof/generatePayload`, {
				method: 'POST',
			})
		).json();

		return response.payload as string;
	}

	async checkProof(proof: TonProofItemReplySuccess['proof'], account: Account) {
		try {
			const reqBody = {
				address: account.address,
				network: account.chain,
				proof: {
					...proof,
					state_init: account.walletStateInit,
				},
			};

			const response = await (
				await fetch(`${this.host}/ton-proof/checkProof`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(reqBody),
				})
			).json();

			if (response?.token) {
				localStorage.setItem(this.localStorageKey, response.token);
				this.accessToken = response.token;
			}
		} catch (e) {
			console.log('checkProof error:', e);
		}
	}

	async getAccountInfo(account: Account) {
		const response = await (
			await fetch(`${this.host}/dapp/getAccountInfo?network=${account.chain}`, {
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					'Content-Type': 'application/json',
				},
			})
		).json();

		return response as {};
	}

	reset() {
		this.accessToken = null;
		localStorage.removeItem(this.localStorageKey);
	}
}

export const TonProofDemoApi = new TonProofDemoApiService();

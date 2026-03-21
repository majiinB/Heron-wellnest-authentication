import { Bucket, Storage, type UploadOptions } from "@google-cloud/storage";
import { PassThrough, type Readable } from "node:stream";
import { env } from "./env.config.js";

type UploadFromBufferInput = {
	buffer: Buffer;
	destination: string;
	contentType?: string;
	metadata?: UploadOptions["metadata"];
};

type UploadFromStreamInput = {
	stream: Readable;
	destination: string;
	contentType?: string;
	metadata?: UploadOptions["metadata"];
};

export const storage = new Storage({
	projectId: env.GCS_PROJECT_ID,
});

export function getStorageBucketName(): string {
	if (!env.GCS_BUCKET_NAME) {
		throw new Error("GCS_BUCKET_NAME is not configured");
	}

	return env.GCS_BUCKET_NAME;
}

export function getStorageBucket(): Bucket {
	return storage.bucket(getStorageBucketName());
}

export async function uploadBufferToGcs(input: UploadFromBufferInput): Promise<string> {
	const pass = new PassThrough();
	pass.end(input.buffer);

	return uploadStreamToGcs({
		stream: pass,
		destination: input.destination,
		contentType: input.contentType,
		metadata: input.metadata,
	});
}

export async function uploadStreamToGcs(input: UploadFromStreamInput): Promise<string> {
	const bucket = getStorageBucket();
	const file = bucket.file(input.destination);

	await new Promise<void>((resolve, reject) => {
		input.stream
			.pipe(
				file.createWriteStream({
					resumable: false,
					contentType: input.contentType,
					metadata: {
						...input.metadata,
						contentType: input.contentType ?? input.metadata?.contentType,
					},
				}),
			)
			.on("finish", resolve)
			.on("error", reject);
	});

	return `gs://${bucket.name}/${input.destination}`;
}

export async function getSignedUrl(objectPath: string):Promise<string> {
	const file = getStorageBucket().file(objectPath);

	const [url] = await file.getSignedUrl({
		action: "read",
		expires: Date.now() + 15 * 60 * 1000, // 15 minutes
	});

	return url;
}

export async function objectExistsInGcs(objectPath: string): Promise<boolean> {
	const file = getStorageBucket().file(objectPath);
	const [exists] = await file.exists();

	return exists;
}

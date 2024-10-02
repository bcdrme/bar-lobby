import type { Static, TObject } from "@sinclair/typebox";
import type { ValidateFunction } from "ajv";
import Ajv from "ajv";
import fs from "fs";
import { assign, SetUndefinedValues } from "$/jaz-ts-utils";
import path from "path";

export class FileStore<T extends TObject> {
    public readonly model: Static<T> = {};
    public readonly filePath: string;

    protected readonly schema: T;
    protected readonly ajv: Ajv;
    protected readonly validator: ValidateFunction;

    constructor(filePath: string, schema: T, defaultModel?: Static<T>) {
        this.filePath = filePath;
        this.schema = schema;
        this.ajv = new Ajv({ coerceTypes: true, useDefaults: true });
        this.validator = this.ajv.compile(this.schema);
        if (defaultModel) {
            this.model = defaultModel;
        }
    }

    public async init() {
        const dir = path.parse(this.filePath).dir;
        await fs.promises.mkdir(dir, { recursive: true });
        if (fs.existsSync(this.filePath)) {
            await this.read();
        } else {
            this.validator(this.model);
            await this.write();
        }
        return this;
    }

    // could throw if the data is invalid
    public async update(data: SetUndefinedValues<T>) {
        // not great since we're modifying the model before validation
        assign(this.model, data);
        const isValid = this.validator(this.model);
        if (isValid) {
            await this.write();
        } else {
            console.error(`Error validating file store: ${this.filePath}`, this.validator.errors);
        }
        return this.model;
    }

    protected async read() {
        const modelStr = await fs.promises.readFile(this.filePath, { encoding: "utf-8" });
        const model = JSON.parse(modelStr);
        const isValid = this.validator(model);
        if (isValid) {
            assign(this.model, model as Static<T>);
        } else {
            console.error(`Error validating file store: ${this.filePath}`, this.validator.errors);
        }
    }

    protected async write() {
        await fs.promises.writeFile(this.filePath, JSON.stringify(this.model, null, 4));
    }
}

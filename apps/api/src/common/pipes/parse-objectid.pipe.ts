import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from "@nestjs/common";
import { Types } from "mongoose";

/**
 * Validates that a parameter is a valid MongoDB ObjectId string.
 * Replaces ParseUUIDPipe which is incompatible with MongoDB.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string, _metadata: ArgumentMetadata): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`"${value}" is not a valid MongoDB ObjectId`);
    }
    return value;
  }
}

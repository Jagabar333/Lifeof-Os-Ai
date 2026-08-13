import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseCrudService } from "../../common/services/base-crud.service";
import { Note, NoteDocument } from "./schemas/note.schema";

@Injectable()
export class NotesService extends BaseCrudService<NoteDocument> {
  constructor(@InjectModel(Note.name) model: Model<NoteDocument>) {
    super(model, "NotesService");
  }

  async search(userId: string, query: string) {
    const data = await this.model
      .find({
        userId,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } }
        ]
      })
      .sort({ updatedAt: -1 })
      .limit(50)
      .exec();

    return data as NoteDocument[];
  }
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseCrudService } from "../../common/services/base-crud.service";
import { CalendarEvent, CalendarEventDocument } from "./schemas/calendar-event.schema";

@Injectable()
export class CalendarService extends BaseCrudService<CalendarEventDocument> {
  constructor(
    @InjectModel(CalendarEvent.name) eventModel: Model<CalendarEventDocument>
  ) {
    super(eventModel, "CalendarService");
  }

  async findByDateRange(userId: string, startDate: string, endDate: string) {
    const data = await this.model.find({
      userId,
      $or: [
        { startTime: { $gte: startDate, $lte: endDate } },
        { endTime: { $gte: startDate, $lte: endDate } },
        { startTime: { $lte: startDate }, endTime: { $gte: endDate } }
      ]
    }).sort({ startTime: 1 }).exec();

    return data;
  }
}

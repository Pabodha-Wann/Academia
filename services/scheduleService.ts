import db from "@/database/db";
import * as scheduleDb from "@/database/queries/schedule";
import { cancelClassNotifications, scheduleClassNotifications } from "@/services/notificationService";
import { useScheduleStore } from "@/store/scheduleStore";
import { useSubjectStore } from "@/store/subjectStore";

export const ScheduleService = {

    loadSchedule(date: string): void {
        const entries = scheduleDb.getScheduleByDate(date);
        useScheduleStore.getState().setEntries(entries);
    },


    setSelectedDate(date: string): void {
        useScheduleStore.getState().setSelectedDateState(date);
        this.loadSchedule(date);
    },


    async createEntry(
        subjectId: number,
        lecturer: string,
        type: string,
        date: string,
        startTime: string,
        endTime: string,
        location: string
    ): Promise<void> {

        scheduleDb.addScheduleEntry(subjectId, lecturer, type, date, startTime, endTime, location);


        const result = db.getFirstSync<{ id: number }>("SELECT last_insert_rowid() as id");
        const lastId = result?.id;


        const currentSelectedDate = useScheduleStore.getState().selectedDate;
        this.loadSchedule(currentSelectedDate);


        if (lastId) {
            const subject = useSubjectStore.getState().subjects.find((s) => s.id === subjectId);
            if (subject) {
                await scheduleClassNotifications(
                    lastId,
                    subject.name,
                    date,
                    startTime,
                    location.trim() || null
                );
            }
        }
    },


    async updateEntry(
        id: number,
        subjectId: number,
        lecturer: string,
        type: string,
        date: string,
        startTime: string,
        endTime: string,
        location: string
    ): Promise<void> {

        scheduleDb.updateScheduleEntry(id, subjectId, lecturer, type, date, startTime, endTime, location);


        const currentSelectedDate = useScheduleStore.getState().selectedDate;
        this.loadSchedule(currentSelectedDate);

        // Reschedule notifications
        const subject = useSubjectStore.getState().subjects.find((s) => s.id === subjectId);
        if (subject) {
            await scheduleClassNotifications(
                id,
                subject.name,
                date,
                startTime,
                location.trim() || null
            );
        }
    },


    async deleteEntry(id: number): Promise<void> {
        await cancelClassNotifications(id);
        scheduleDb.deleteSchedule(id);
        const currentSelectedDate = useScheduleStore.getState().selectedDate;
        this.loadSchedule(currentSelectedDate);
    }
};

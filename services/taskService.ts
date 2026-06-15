import db from "@/database/db";
import * as taskDb from "@/database/queries/tasks";
import { cancelTaskNotifications, scheduleTaskNotifications } from "@/services/notificationService";
import { useTaskStore } from "@/store/taskStore";

export const TaskService = {

    loadTasks(date: string | null): void {
        const tasks = date ? taskDb.getTaskByDate(date) : taskDb.getAllTasks();
        useTaskStore.getState().setTasks(tasks);
    },


    setSelectedDate(date: string | null): void {
        useTaskStore.getState().setSelectedDateState(date);
        this.loadTasks(date);
    },


    setFilterStatus(status: 'all' | 'pending' | 'done'): void {
        useTaskStore.getState().setFilterStatusState(status);
    },


    async createTask(
        subjectId: number | null,
        title: string,
        description: string,
        dueDate: string,
        priority: string
    ): Promise<void> {

        taskDb.addTask(subjectId, title, description, dueDate, priority);

        // Get last inserted ID to schedule notifications
        const result = db.getFirstSync<{ id: number }>("SELECT last_insert_rowid() as id");
        const lastId = result?.id;


        const currentSelectedDate = useTaskStore.getState().selectedDate;
        this.loadTasks(currentSelectedDate);

        // Schedule notifications for the new task
        if (lastId) {
            await scheduleTaskNotifications(lastId, title, dueDate);
        }
    },


    async updateTask(
        id: number,
        subjectId: number | null,
        title: string,
        description: string,
        dueDate: string,
        priority: string
    ): Promise<void> {

        taskDb.updateTask(id, subjectId, title, description, dueDate, priority);


        const currentSelectedDate = useTaskStore.getState().selectedDate;
        this.loadTasks(currentSelectedDate);

        // Reschedule notifications (internally cancels old ones first)
        await scheduleTaskNotifications(id, title, dueDate);
    },


    async toggleTaskStatus(id: number, currentStatus: string): Promise<void> {

        taskDb.toggleTaskStatus(id, currentStatus);


        const currentSelectedDate = useTaskStore.getState().selectedDate;
        this.loadTasks(currentSelectedDate);

        // If it was completed, cancel notifications. If marked pending, reschedule them.
        if (currentStatus === 'pending') {
            await cancelTaskNotifications(id);
        } else {
            const tasks = useTaskStore.getState().tasks;
            const task = tasks.find((t) => t.id === id);
            if (task) {
                await scheduleTaskNotifications(id, task.title, task.due_date);
            }
        }
    },


    async deleteTask(id: number): Promise<void> {

        await cancelTaskNotifications(id);

        taskDb.deleteTask(id);

        const currentSelectedDate = useTaskStore.getState().selectedDate;
        this.loadTasks(currentSelectedDate);
    }
};

import { useNotficationStore } from "@/store/notificationStore";
import { useTaskStore } from "@/store/taskStore";
import * as Notifications from 'expo-notifications';

const IS_TESTING = true;

export async function scheduleTaskNotifications(
    taskId: number,
    title: string,
    dueDate: string,
): Promise<void> {
    try {
        const { taskReminders } = useNotficationStore.getState();
        if (!taskReminders) return

        //if task aleady done
        const { tasks } = useTaskStore.getState();
        const task = tasks.find((t) => t.id === taskId);
        if (task?.status === 'done') {
            await cancelTaskNotifications(taskId);
            return;
        }

        const due = new Date(dueDate)
        due.setMinutes(due.getMinutes() + due.getTimezoneOffset());

        const now = new Date();

        //check if due date is in past
        if (due < now) {
            await cancelTaskNotifications(taskId);
            return;
        }

        //Day before 8 AM
        const dayBefore = new Date(due);
        dayBefore.setDate(due.getDate() - 1);
        dayBefore.setHours(8, 0, 0, 0);

        //Same day 8AM
        const sameDay = new Date(due);
        sameDay.setHours(8, 0, 0, 0);

        //cancel
        await cancelTaskNotifications(taskId);

        if (dayBefore > now) {
            await Notifications.scheduleNotificationAsync({
                identifier: `task-${taskId}-before`,
                content: {
                    title: `📚 Task Due Tomorrow`,
                    body: `"${title}" is due tomorrow. Don't forget!`,
                    data: { taskId, type: 'task' },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: dayBefore
                }
            });
        }

        if (sameDay > now) {
            await Notifications.scheduleNotificationAsync({
                identifier: `task-${taskId}-same`,
                content: {
                    title: '📚 Assignment Due Today',
                    body: `"${title}" is due today. Submit it now!`,
                    data: { taskId, type: 'task' },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: sameDay,
                },
            });
        }

        const testTime = new Date();
        testTime.setSeconds(testTime.getSeconds() + 10);

        if (IS_TESTING) {
            await Notifications.scheduleNotificationAsync({
                identifier: `task-${taskId}-24h`,
                content: {
                    title: '📚 Due in 24 Hours',
                    body: `"${title}" is due tomorrow`,
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: testTime,
                },
            });
        }
    } catch (error) {
        console.warn('Failed to schedule task notifications:', error);
    }
}

// Class Notifications

export async function scheduleClassNotifications(
    scheduleId: number,
    subjectName: string,
    date: string,
    startTime: string,
    location: string | null,
): Promise<void> {
    try {
        const { classReminders } = useNotficationStore.getState();
        if (!classReminders) return;

        // Parse date cleanly
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = startTime.split(':').map(Number);

        // Build class start datetime in local time
        const classStart = new Date(year, month - 1, day, hours, minutes, 0);
        const now = new Date();

        // If class already started or passed 
        if (classStart < now) {
            await cancelClassNotifications(scheduleId);
            return;
        }

        // 30 mins before
        const thirtyBefore = new Date(classStart);
        thirtyBefore.setMinutes(classStart.getMinutes() - 30);

        // 15 mins before
        const fifteenBefore = new Date(classStart);
        fifteenBefore.setMinutes(classStart.getMinutes() - 15);

        const locationText = location ? ` · ${location}` : '';

        await cancelClassNotifications(scheduleId);

        if (thirtyBefore > now) {
            await Notifications.scheduleNotificationAsync({
                identifier: `class-${scheduleId}-30`,
                content: {
                    title: '📅 Class in 30 Minutes',
                    body: `${subjectName} starts soon${locationText}`,
                    data: { scheduleId, type: 'class' },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: thirtyBefore,
                },
            });
        }

        if (fifteenBefore > now) {
            await Notifications.scheduleNotificationAsync({
                identifier: `class-${scheduleId}-15`,
                content: {
                    title: '📅 Class in 15 Minutes',
                    body: `${subjectName} is starting soon${locationText}`,
                    data: { scheduleId, type: 'class' },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: fifteenBefore,
                },
            });
        }

        if (IS_TESTING) {
            const testTime = new Date();
            testTime.setSeconds(testTime.getSeconds() + 10);

            await Notifications.scheduleNotificationAsync({
                identifier: `class-${scheduleId}-test`,
                content: {
                    title: '📅 Class Test Notification',
                    body: `${subjectName} notification is working!`,
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: testTime,
                },
            });
            return;
        }
    } catch (error) {
        console.warn('Failed to schedule class notifications:', error);
    }
}

export async function cancelClassNotifications(scheduleId: number): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(`class-${scheduleId}-30`).catch(() => { });
    await Notifications.cancelScheduledNotificationAsync(`class-${scheduleId}-15`).catch(() => { });
}



export async function cancelTaskNotifications(taskId: number): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(`task-${taskId}-before`).catch(() => { });
    await Notifications.cancelScheduledNotificationAsync(`task-${taskId}-same`).catch(() => { });
    await Notifications.cancelScheduledNotificationAsync(`task-${taskId}-24h`).catch(() => { })
}

export async function requestNotificationPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        console.log('Notification permission denied');
    }
}
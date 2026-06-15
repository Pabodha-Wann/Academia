import { useNotficationStore } from "@/store/notificationStore";
import { useTaskStore } from "@/store/taskStore";
import * as Notifications from 'expo-notifications';

export async function scheduleTaskNotifications(
    taskId: number,
    title: string,
    dueDate: string,
): Promise<void> {
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
                body: `${title}" is due tomorrow. Don't forget!`,
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

    if (true) {
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
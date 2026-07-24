enum TrainingStatus {
    NOT_REQUIRED,
    COMPLETED,
    PENDING,
    OVERDUE
}

class Employee {
    int startDay;
    Integer trainedDay; // null means not completed
    String groupId;

    Employee(int startDay, Integer trainedDay, String groupId) {
        this.startDay = startDay;
        this.trainedDay = trainedDay;
        this.groupId = groupId;
    }
}

class StatusResult {
    TrainingStatus status;
    int overdueDays;

    StatusResult(TrainingStatus status, int overdueDays) {
        this.status = status;
        this.overdueDays = overdueDays;
    }

    @Override
    public String toString() {
        return status + ", overdue days: " + overdueDays;
    }
}

public class TrainingService {

    public static StatusResult getTrainingStatus(
        Employee employee,
        int trainingWindow,
        int checkDay
    ) {
        if (employee == null) {
            throw new IllegalArgumentException("Employee cannot be null");
        }

        // No assigned group means training is not required.
        if (employee.groupId == null || employee.groupId.isBlank()) {
            return new StatusResult(TrainingStatus.NOT_REQUIRED, 0);
        }

        int dueDay = employee.startDay + trainingWindow;

        // Training has been completed.
        if (employee.trainedDay != null) {
            if (employee.trainedDay <= dueDay) {
                return new StatusResult(TrainingStatus.COMPLETED, 0);
            }

            return new StatusResult(
                TrainingStatus.OVERDUE,
                employee.trainedDay - dueDay
            );
        }

        // Training is incomplete but still within the allowed window.
        if (checkDay <= dueDay) {
            return new StatusResult(TrainingStatus.PENDING, 0);
        }

        // Training is incomplete and past the deadline.
        return new StatusResult(
            TrainingStatus.OVERDUE,
            checkDay - dueDay
        );
    }

    public static void main(String[] args) {
        Employee e1 = new Employee(1, null, "A");

        StatusResult result = getTrainingStatus(e1, 10, 16);

        System.out.println(result);
        // OVERDUE, overdue days: 5
    }
}
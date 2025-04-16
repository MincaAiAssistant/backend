-- Text to SQL original prompt:
-- mock 1 teacher have 2 class, each class have 2 group of student, each group have 4-5 students, each Software Engineerlso have some chapters
INSERT INTO users (username, name, email, password) VALUES
('teacher1', 'Teacher One', 'teacher1@example.com', 'password123'),
('student1', 'Student One', 'student1@example.com', 'pass1'),
('student2', 'Student Two', 'student2@example.com', 'pass2'),
('student3', 'Student Three', 'student3@example.com', 'pass3'),
('student4', 'Student Four', 'student4@example.com', 'pass4'),
('student5', 'Student Five', 'student5@example.com', 'pass5'),
('student6', 'Student Six', 'student6@example.com', 'pass6'),
('student7', 'Student Seven', 'student7@example.com', 'pass7'),
('student8', 'Student Eight', 'student8@example.com', 'pass8'),
('student9', 'Student Nine', 'student9@example.com', 'pass9'),
('student10', 'Student Ten', 'student10@example.com', 'pass10'),
('student11', 'Student Eleven', 'student11@example.com', 'pass11'),
('student12', 'Student Twelve', 'student12@example.com', 'pass12'),
('student13', 'Student Thirteen', 'student13@example.com', 'pass13'),
('student14', 'Student Fourteen', 'student14@example.com', 'pass14'),
('student15', 'Student Fifteen', 'student15@example.com', 'pass15'),
('student16', 'Student Sixteen', 'student16@example.com', 'pass16'),
('student17', 'Student Seventeen', 'student17@example.com', 'pass17'),
('student18', 'Student Eighteen', 'student18@example.com', 'pass18');

INSERT INTO teachers (userid) VALUES ((SELECT userid FROM users WHERE username = 'teacher1'));

INSERT INTO classes (classSubject, classNumber, teacherid) VALUES
('Software Engineer', 'CC03', (SELECT userid FROM users WHERE username = 'teacher1')),
('Software Engineer 2', 'CC01', (SELECT userid FROM users WHERE username = 'teacher1'));

INSERT INTO groups (classid) VALUES
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer')),
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer')),
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer 2')),
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer 2'));

INSERT INTO students (userid, groupid) VALUES
((SELECT userid FROM users WHERE username = 'student1'), (SELECT groupid FROM groups LIMIT 1 OFFSET 0)),
((SELECT userid FROM users WHERE username = 'student2'), (SELECT groupid FROM groups LIMIT 1 OFFSET 0)),
((SELECT userid FROM users WHERE username = 'student3'), (SELECT groupid FROM groups LIMIT 1 OFFSET 0)),
((SELECT userid FROM users WHERE username = 'student4'), (SELECT groupid FROM groups LIMIT 1 OFFSET 0)),
((SELECT userid FROM users WHERE username = 'student5'), (SELECT groupid FROM groups LIMIT 1 OFFSET 0)),
((SELECT userid FROM users WHERE username = 'student6'), (SELECT groupid FROM groups LIMIT 1 OFFSET 1)),
((SELECT userid FROM users WHERE username = 'student7'), (SELECT groupid FROM groups LIMIT 1 OFFSET 1)),
((SELECT userid FROM users WHERE username = 'student8'), (SELECT groupid FROM groups LIMIT 1 OFFSET 1)),
((SELECT userid FROM users WHERE username = 'student9'), (SELECT groupid FROM groups LIMIT 1 OFFSET 1)),
((SELECT userid FROM users WHERE username = 'student10'), (SELECT groupid FROM groups LIMIT 1 OFFSET 2)),
((SELECT userid FROM users WHERE username = 'student11'), (SELECT groupid FROM groups LIMIT 1 OFFSET 2)),
((SELECT userid FROM users WHERE username = 'student12'), (SELECT groupid FROM groups LIMIT 1 OFFSET 2)),
((SELECT userid FROM users WHERE username = 'student13'), (SELECT groupid FROM groups LIMIT 1 OFFSET 2)),
((SELECT userid FROM users WHERE username = 'student14'), (SELECT groupid FROM groups LIMIT 1 OFFSET 2)),
((SELECT userid FROM users WHERE username = 'student15'), (SELECT groupid FROM groups LIMIT 1 OFFSET 3)),
((SELECT userid FROM users WHERE username = 'student16'), (SELECT groupid FROM groups LIMIT 1 OFFSET 3)),
((SELECT userid FROM users WHERE username = 'student17'), (SELECT groupid FROM groups LIMIT 1 OFFSET 3)),
((SELECT userid FROM users WHERE username = 'student18'), (SELECT groupid FROM groups LIMIT 1 OFFSET 3));

INSERT INTO chapters (classid, title, description) VALUES
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer'), 'Chapter 1A', 'Description for Chapter 1A'),
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer'), 'Chapter 2A', 'Description for Chapter 2A'),
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer'), 'Chapter 3A', 'Description for Chapter 3A'),
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer 2'), 'Chapter 1B', 'Description for Chapter 1B'),
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer 2'), 'Chapter 2B', 'Description for Chapter 2B'),
((SELECT classid FROM classes WHERE classsubject = 'Software Engineer 2'), 'Chapter 3B', 'Description for Chapter 3B');
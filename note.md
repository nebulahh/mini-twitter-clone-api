
model Following {
  id       Int    @id @default(autoincrement())
  name     String
  avatar   String
  followId Int
  user     User?  @relation(fields: [userId], references: [id])
  userId   Int?
}
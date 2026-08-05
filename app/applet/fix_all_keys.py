with open('src/components/AdmissionsExplorer.tsx', 'r') as f:
    c = f.read()
c = c.replace('filteredArticles.map((article, index) => (\n                  <button\n                    key={}', 'filteredArticles.map((article, index) => (\n                  <button\n                    key={article.id + "-" + index}')
c = c.replace('filteredCourses.map((course, index) => (\n                  <button\n                    key={}', 'filteredCourses.map((course, index) => (\n                  <button\n                    key={course.id + "-" + index}')
c = c.replace('filteredInstitutions.map((inst, index) => (\n                  <button\n                    key={}', 'filteredInstitutions.map((inst, index) => (\n                  <button\n                    key={inst.id + "-" + index}')
with open('src/components/AdmissionsExplorer.tsx', 'w') as f:
    f.write(c)

with open('src/components/TopRankings.tsx', 'r') as f:
    c = f.read()
c = c.replace('TOP_UNIS.slice(0, 3).map((uni, index) => (\n                <motion.button\n                  key={}', 'TOP_UNIS.slice(0, 3).map((uni, index) => (\n                <motion.button\n                  key={uni.slug + "-" + index}')
c = c.replace('TOP_UNIS.slice(3).map((uni, index) => (\n                <button\n                  key={}', 'TOP_UNIS.slice(3).map((uni, index) => (\n                <button\n                  key={uni.slug + "-" + (index + 3)}')
with open('src/components/TopRankings.tsx', 'w') as f:
    f.write(c)

with open('src/components/FormulasTab.tsx', 'r') as f:
    c = f.read()
c = c.replace('universities.map((u, index) => <option key={}', 'universities.map((u, index) => <option key={u.slug + "-" + index}')
with open('src/components/FormulasTab.tsx', 'w') as f:
    f.write(c)

print('All keys fixed successfully!')

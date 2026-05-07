lines = open('combinationpizzahutandtacobell.txt', 'r').readlines()

lines_set = set(lines)

out  = open('combinationpizzahutandtacobell.txt', 'w')

for line in lines_set:
    out.write(line)
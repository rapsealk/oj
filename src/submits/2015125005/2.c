#include <stdio.h>
#include <ctype.h>

int main()
{
	int i, j;
	char str1[100];
	char str2[200];

	fgets(str1, sizeof(str1), stdin);
	fgets(str2, sizeof(str2), stdin);

	for (i = 0; str1[i] != '\0'; i++) {
		if (isalpha(str1[i])) {
			for (j = 0; str2[j] != '\0'; j++) {
				if (toupper(str1[i]) == toupper(str2[j])) {
					str1[i] = str2[j] = (char) -1;
					break;
				}
			}
		}
	}

	for (j = 0; str2[j] != '\0'; j++) if (isalpha(str2[j])) {
		printf("NO\n");
		return 0;
	}

	printf("OK\n");

	return 0;
}
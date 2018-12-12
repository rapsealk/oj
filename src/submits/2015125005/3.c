#include <stdio.h>

int main()
{
	int n, i, j;
	scanf("%d", &n);
	if (n % 2 == 0) n -= 1;
	if (n == 1) {
		printf("*\n");
		return 0;
	}
	// Top
	for (i = n / 2; i > 0; i--) printf(" "); printf("*\n");
	// ~ Middle
	for (i = n / 2; i > 0; i--) {
		for (j = 1; j < i; j++) printf(" "); printf("*");
		for (j = 2 * ((n / 2) - i) + 1; j > 0; j--) printf(" "); printf("*\n");
	}
	// Middle + 1 ~
	for (i = 1; i <= n / 2 - 1; i++) {
		for (j = 0; j < i; j++) printf(" "); printf("*");
		for (j = 2 * ((n / 2) - i) - 1; j > 0; j--) printf(" "); printf("*\n");
	}
	// Bottom
	for (i = n / 2; i > 0; i--) printf(" "); printf("*\n");
	return 0;
}